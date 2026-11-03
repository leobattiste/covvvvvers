import type { Moment } from "./history";

/**
 * Additional archival milestones supported by the research references
 * collected in the timeline's final Sources section.
 * Do not add unsupported release dates or unlicensed archival images here.
 */
export const RESEARCH_MOMENTS: Moment[] = [
  {
    id: "bronx-flyers-archive",
    when: "1977–1983",
    title: "The flyers that documented the early scene",
    text: "Before rap was a record-industry business, hand-made flyers advertised DJs, MC crews, parties, venues and admission prices. Designers including Buddy Esquire and Phase 2 combined lettering, photographs and cut-paper graphics. Cornell University's preserved flyers now provide dated evidence of the people and places behind early hip-hop.",
    tags: ["culture"],
  },
  {
    id: "joe-conzo-archive",
    when: "1976–1984",
    title: "Joe Conzo Jr. photographs hip-hop's earliest years",
    text: "Bronx photographer Joe Conzo Jr. documented performances, performers and neighborhood life as hip-hop emerged. His photographs capture the culture before commercial rap became widespread. Cornell University's Hip Hop Collection preserves thousands of digitized photographs from his archive, providing visual evidence of the people, settings and performances of the era.",
    tags: ["culture"],
  },
  {
    id: "hiphop-france-arrives",
    when: "1982–1984",
    title: "Hip-hop takes root in France",
    text: "Hip-hop reached French audiences through music, dance and visual culture in the early 1980s. Breakers gathered at the Trocadéro and graffiti writers worked across Paris as the movement developed its own local language. The scenes that followed would help establish a lasting French-language rap tradition.",
    tags: ["culture"],
  },
  {
    id: "pen-pixel-founded",
    when: "1992",
    title: "Pen & Pixel develops a new Southern cover aesthetic",
    text: "Brothers Shawn and Aaron Brauch founded Houston's Pen & Pixel Graphics. Its digitally assembled portraits, metallic lettering, jewelry, cars and fantastical settings became closely associated with Southern independent rap, especially No Limit and Cash Money. The University of Houston preserves a collection of the firm's original materials.",
    tags: ["culture", "tech", "business"],
  },
  {
    id: "grime-pirate-radio",
    when: "Early 2000s",
    title: "London's pirate-radio networks nurture grime",
    text: "In East London, producers and MCs developed grime through pirate-radio sets, local record shops, raves and independent releases. Drawing from UK garage, jungle and other Black British musical traditions, the scene established a distinct style of rapid MC performance and electronic production. Grime has its own history and should not simply be classified as American rap.",
    tags: ["sound", "culture", "tech"],
  },
  {
    id: "senegal-yenamarre",
    when: "2011",
    title: "Senegalese rappers help organize Y'en a Marre",
    text: "Rappers and journalists in Dakar established the Y'en a Marre civic movement in 2011. Building on a longer Senegalese tradition of politically engaged hip-hop, the group mobilized young people through music, public protest and voter engagement during the period leading to the 2012 presidential election.",
    tags: ["culture"],
  },
];

export const RESEARCH_SOURCES = [
  { title: "Smithsonian NMAAHC — Hip-Hop in the Bronx", url: "https://nmaahc.si.edu/explore/stories/hip-hop-bronx" },
  { title: "Smithsonian National Museum of American History — The sazón in hip-hop", url: "https://americanhistory.si.edu/explore/stories/sazon-hip-hop" },
  { title: "Library of Congress — Early Hip-Hop at the Library of Congress", url: "https://blogs.loc.gov/music/2023/08/early-hip-hop-at-the-library-of-congress/" },
  { title: "Library of Congress — Complete National Recording Registry", url: "https://www.loc.gov/programs/national-recording-preservation-board/recording-registry/complete-national-recording-registry-listing/" },
  { title: "Cornell Hip Hop Collection — Digital collections and event flyers", url: "https://hiphop.library.cornell.edu/digital-collections/" },
  { title: "Cornell University Library — Hip Hop Party and Event Flyers", url: "https://dcp-production-container.library.cornell.edu/collections/hiphopflyers" },
  { title: "Bibliothèque publique d'information — Culture Hip-Hop à la française", url: "https://www.bpi.fr/selection-ressources-hip-hop-france/" },
  { title: "University of Houston Libraries — Pen & Pixel collection", url: "https://digitalcollections.lib.uh.edu/collections/mg74qn10n" },
  { title: "The Hip Hop Museum — Interview with Pen & Pixel co-founder Shawn Brauch", url: "https://thhm.org/blog/artifacts-pen-and-pixel/" },
  { title: "British Council — 8 Bar: The Evolution of Grime", url: "https://filmsandfestivals.britishcouncil.org/projects/8-bar--the-evolution-of-grime" },
  { title: "Alex de Lacey — Pirate radio and grime, Radio Journal (2021)", url: "https://doi.org/10.1386/rjao_00041_1" },
  { title: "Wilson Center — Music as a Tool for Peacebuilding in Senegal", url: "https://www.wilsoncenter.org/blog-post/music-tool-peacebuilding-senegal-ahead-2024-elections" },
  { title: "Y'en a Marre — Official movement history", url: "https://yenamarre.sn/yenamarre/historique/" },
  { title: "Recording Academy — Kendrick Lamar awards and nominations", url: "https://www.grammy.com/artists/kendrick-lamar/17949/" },
  { title: "Smithsonian — Anthology of Hip-Hop and Rap", url: "https://nmaahc.si.edu/explore/publications/smithsonian-anthology-hip-hop-and-rap" },
];
