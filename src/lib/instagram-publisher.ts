/**
 * @file src/lib/instagram-publisher.ts
 * @description Instagram Graph API v23.0/v24.0 3-Step Asynchronous Container Publishing Engine
 *
 * Implements strict container lifecycle:
 * 1. Container creation (Photo, Reel, Carousel children).
 * 2. Asynchronous status polling until FINISHED (mitigates Error 9007).
 * 3. Container publication.
 * Enforces X-Business-Use-Case-Usage rate limit monitoring.
 */

const GRAPH_API_BASE = 'https://graph.facebook.com/v23.0';

export interface PublishMediaItem {
  url: string;
  type: 'IMAGE' | 'VIDEO';
}

export interface PublishPostParams {
  igUserId: string;
  accessToken: string;
  caption: string;
  format: 'STATIC' | 'REEL' | 'CAROUSEL' | 'STORY';
  items: PublishMediaItem[];
}

/**
 * Parses Instagram Graph API rate-limit header
 */
function checkRateLimits(response: Response) {
  const usageHeader = response.headers.get('x-business-use-case-usage');
  if (usageHeader) {
    try {
      const parsed = JSON.parse(usageHeader);
      for (const accountId of Object.keys(parsed)) {
        const usage = parsed[accountId]?.[0];
        if (usage && usage.acc_id_util_pct >= 80) {
          console.warn(`[IG Rate Limit Warning] Account ${accountId} is at ${usage.acc_id_util_pct}% utilization.`);
        }
      }
    } catch {
      // ignore json parse errors on header
    }
  }
}

/**
 * Polls container status until status_code === 'FINISHED' or timeout
 */
async function pollContainerStatus(creationId: string, accessToken: string, maxAttempts = 15): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const url = `${GRAPH_API_BASE}/${creationId}?fields=status_code&access_token=${accessToken}`;
    const res = await fetch(url);
    checkRateLimits(res);

    if (res.ok) {
      const data = await res.json();
      if (data.status_code === 'FINISHED') {
        return true;
      }
      if (data.status_code === 'ERROR') {
        throw new Error(`Instagram container encoding error on ID ${creationId}`);
      }
    }

    // Wait 5 seconds between polls
    await new Promise((r) => setTimeout(r, 5000));
  }

  throw new Error(`Timeout waiting for container ${creationId} to finish encoding.`);
}

/**
 * Core Instagram Publishing Engine
 */
export async function publishToInstagram({
  igUserId,
  accessToken,
  caption,
  format,
  items,
}: PublishPostParams) {
  if (!items || items.length === 0) {
    throw new Error('Cannot publish to Instagram without at least one media item.');
  }

  if (!igUserId || !accessToken) {
    return {
      success: true,
      publishedMediaId: `mock_ig_${Date.now()}`,
      mock: true,
      message: 'Instagram credentials not configured; publication simulated.',
    };
  }

  try {
    let finalContainerId = '';

    // CASE 1: Single Photo
    if (format === 'STATIC' && items[0]) {
      const params = new URLSearchParams({
        image_url: items[0].url,
        caption,
        access_token: accessToken,
      });

      const res = await fetch(`${GRAPH_API_BASE}/${igUserId}/media`, {
        method: 'POST',
        body: params,
      });
      checkRateLimits(res);
      const data = await res.json();
      if (!data.id) throw new Error(`Container creation failed: ${JSON.stringify(data)}`);

      finalContainerId = data.id;
      await pollContainerStatus(finalContainerId, accessToken);
    }

    // CASE 2: Single Reel
    else if (format === 'REEL' && items[0]) {
      const params = new URLSearchParams({
        media_type: 'REELS',
        video_url: items[0].url,
        caption,
        share_to_feed: 'true',
        access_token: accessToken,
      });

      const res = await fetch(`${GRAPH_API_BASE}/${igUserId}/media`, {
        method: 'POST',
        body: params,
      });
      checkRateLimits(res);
      const data = await res.json();
      if (!data.id) throw new Error(`Reel container creation failed: ${JSON.stringify(data)}`);

      finalContainerId = data.id;
      await pollContainerStatus(finalContainerId, accessToken);
    }

    // CASE 3: Multi-Slide Carousel (2 to 10 items)
    else if (format === 'CAROUSEL') {
      if (items.length < 2 || items.length > 10) {
        throw new Error(`Carousel requires between 2 and 10 items. Got: ${items.length}`);
      }

      const childIds: string[] = [];

      // Step 3A: Create child containers
      for (const item of items) {
        const params = new URLSearchParams({
          is_carousel_item: 'true',
          access_token: accessToken,
        });

        if (item.type === 'VIDEO') {
          params.append('media_type', 'VIDEO');
          params.append('video_url', item.url);
        } else {
          params.append('image_url', item.url);
        }

        const childRes = await fetch(`${GRAPH_API_BASE}/${igUserId}/media`, {
          method: 'POST',
          body: params,
        });
        checkRateLimits(childRes);
        const childData = await childRes.json();
        if (!childData.id) throw new Error(`Child container error: ${JSON.stringify(childData)}`);

        childIds.push(childData.id);
      }

      // Step 3B: Poll all child containers until FINISHED
      for (const childId of childIds) {
        await pollContainerStatus(childId, accessToken);
      }

      // Step 3C: Create parent carousel container
      const parentParams = new URLSearchParams({
        media_type: 'CAROUSEL',
        children: childIds.join(','),
        caption,
        access_token: accessToken,
      });

      const parentRes = await fetch(`${GRAPH_API_BASE}/${igUserId}/media`, {
        method: 'POST',
        body: parentParams,
      });
      checkRateLimits(parentRes);
      const parentData = await parentRes.json();
      if (!parentData.id) throw new Error(`Parent carousel creation error: ${JSON.stringify(parentData)}`);

      finalContainerId = parentData.id;
      await pollContainerStatus(finalContainerId, accessToken);
    }

    // FINAL STEP: Publish container
    const publishParams = new URLSearchParams({
      creation_id: finalContainerId,
      access_token: accessToken,
    });

    const publishRes = await fetch(`${GRAPH_API_BASE}/${igUserId}/media_publish`, {
      method: 'POST',
      body: publishParams,
    });
    checkRateLimits(publishRes);
    const publishData = await publishRes.json();

    if (!publishData.id) {
      throw new Error(`Publication error: ${JSON.stringify(publishData)}`);
    }

    return {
      success: true,
      containerId: finalContainerId,
      publishedMediaId: publishData.id,
    };
  } catch (err: any) {
    console.error('Instagram Publisher Exception:', err);
    return { success: false, error: err.message };
  }
}
