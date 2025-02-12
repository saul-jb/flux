import { SDNAClass, SubjectFlag, SubjectProperty } from "@coasys/ad4m";

@SDNAClass({
  name: "Answer",
})
export default class Answer {
  @SubjectFlag({
    through: "flux://entry_type",
    value: "flux://has_answer",
  })
  type: string;

  @SubjectProperty({
    through: "rdf://text",
    writable: true,
    resolveLanguage: "literal",
  })
  text: string;
}
