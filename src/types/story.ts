// SPEC.md §20: the real-world story a topic tells over its slide seed.
export interface TopicStory {
  scenario: string // markdown for the Scenario tab; opens with the illustrative label
  cast: Record<string, string> // seed node id -> the device it plays, e.g. { D: 'field clinic laptop' }
}
