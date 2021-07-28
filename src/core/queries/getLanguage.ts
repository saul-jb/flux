import { apolloClient } from "@/utils/setupApolloClient";

import unwrapApolloResult from "@/utils/unwrapApolloResult";
import { LanguageHandle } from "@perspect3vism/ad4m-types";
import { LANGUAGE } from "../graphql_queries";

export async function getLanguage(address: string): Promise<LanguageHandle> {
  const { language } = unwrapApolloResult(
    await apolloClient.query({
      query: LANGUAGE,
      variables: { address },
    })
  );
  return language;
}
