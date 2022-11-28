import { getAd4mClient } from "@perspect3vism/ad4m-connect/dist/utils";
import { getMetaFromLinks } from "utils/helpers/getNeighbourhoodMeta";
import { PerspectiveProxy } from "@perspect3vism/ad4m";
import { useDataStore } from ".";
import { CommunityState, LocalCommunityState } from "../types";
import getCommunityMetadata from "utils/api/getCommunityMetadata";
import { useUserStore } from "../user";
import getProfile from "utils/api/getProfile";
import getChannels from "utils/api/getChannels";

export async function buildCommunity(perspective: PerspectiveProxy) {
  const dataStore = useDataStore();
  const communityState = dataStore.getLocalCommunityState(perspective.uuid);

  let state: LocalCommunityState = {
    perspectiveUuid: perspective.uuid,
    theme: {
      fontSize: "md",
      fontFamily: "DM Sans",
      name: "default",
      hue: 270,
      saturation: 60,
    },
    useLocalTheme: false,
    currentChannelId: null,
    hideMutedChannels: false,
    hasNewMessages: false,
    collapseChannelList: false,
    notifications: {
      mute: false,
    },
  };

  if (communityState && communityState) {
    state = communityState;
  }

  const meta = getMetaFromLinks(perspective.neighbourhood?.meta?.links!);

  const groupExp = await getCommunityMetadata(perspective.uuid);

  return {
    neighbourhood: {
      uuid: perspective.uuid,
      author: meta.author,
      timestamp: new Date().toISOString(),
      name: groupExp?.name || meta.name,
      description: groupExp?.description || meta.description,
      image: groupExp?.image || "",
      thumbnail: groupExp?.thumbnail || "",
      neighbourhoodUrl: perspective.sharedUrl,
      members: [meta.author],
    },
    state,
  } as CommunityState;
}

export async function hydrateState() {
  const client = await getAd4mClient();
  const dataStore = useDataStore();
  const userStore = useUserStore();
  const perspectives = await client.perspective.all();
  const status = await client.agent.status();

  const profile = await getProfile(status.did!);

  userStore.setUserProfile(profile!);

  userStore.updateAgentStatus(status);

  const communities = dataStore.getCommunities.filter(
    (community) =>
      !perspectives.map((e) => e.uuid).includes(community.state.perspectiveUuid)
  );

  for (const community of communities) {
    dataStore.removeCommunity({ communityId: community.state.perspectiveUuid });

    dataStore.clearChannels({ communityId: community.state.perspectiveUuid });
  }

  for (const perspective of perspectives) {
    const hasCommunityAlready = dataStore.getCommunities.find(
      (c) => c.state.perspectiveUuid === perspective.uuid
    );

    if (hasCommunityAlready) return;

    if (perspective.sharedUrl !== undefined && perspective.neighbourhood) {
      const newCommunity = await buildCommunity(perspective);

      dataStore.addCommunity(newCommunity);
    }
  }
}
