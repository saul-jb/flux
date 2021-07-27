import { ChannelState, FeedType, MembraneType } from "@/store/types";
import { getTypedExpressionLanguages } from "@/core/methods/getTypedExpressionLangs";
import { findNameDescriptionFromMeta } from "./findNameDescriptionFromMeta";
import { joinNeighbourhood } from "../mutations/joinNeighbourhood";
import { getPerspectiveSnapshot } from "../queries/getPerspective";

export async function joinChannelFromSharedLink(
  url: string,
  parentPerspectiveUUID: string
): Promise<ChannelState> {
  console.log("Starting sharedperspective join");
  const neighbourhood = await joinNeighbourhood(url);
  console.log(new Date(), "Joined neighbourhood with result", neighbourhood);

  const perspectiveSnapshot = await getPerspectiveSnapshot(neighbourhood.uuid);

  const [typedExpressionLanguages, _] = await getTypedExpressionLanguages(
    perspectiveSnapshot!,
    false
  );

  //Read out metadata about the perspective from the meta
  const { name, description } = findNameDescriptionFromMeta(
    perspectiveSnapshot!
  );

  //TODO: derive membraneType from link on sharedPerspective
  return {
    neighbourhood: {
      name: name,
      description: description,
      perspective: neighbourhood,
      typedExpressionLanguages: typedExpressionLanguages,
      neighbourhoodUrl: url,
      membraneType: MembraneType.Inherited,
      linkedPerspectives: [],
      linkedNeighbourhoods: [],
      members: [],
      currentExpressionLinks: {},
      currentExpressionMessages: {},
      createdAt: new Date(),
      membraneRoot: parentPerspectiveUUID,
    },
    state: {
      perspectiveUuid: neighbourhood.uuid,
      hasNewMessages: false,
      feedType: FeedType.Signaled,
      notifications: {
        mute: false,
      },
    },
  } as ChannelState;
}
