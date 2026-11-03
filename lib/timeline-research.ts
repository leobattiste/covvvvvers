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
    sources: ["cornell-flyers"],
  },
  {
    id: "mc-lyte-debut",
    when: "1988",
    title: "MC Lyte releases Lyte as a Rock",
    text: "MC Lyte's debut Lyte as a Rock became the first solo album released by a woman rapper, according to the Smithsonian's National Museum of African American History and Culture. It expanded the possibilities for women in recorded rap, building on the work of pioneering performers who were already central to hip-hop's live scene.",
    tags: ["women", "first", "culture"],
    sources: ["smithsonian-represent"],
  },
  {
    id: "joe-conzo-archive",
    when: "1976–1984",
    title: "Joe Conzo Jr. photographs hip-hop's earliest years",
    text: "Bronx photographer Joe Conzo Jr. documented performances, performers and neighborhood life as hip-hop emerged. His photographs capture the culture before commercial rap became widespread. Cornell University's Hip Hop Collection preserves thousands of digitized photographs from his archive, providing visual evidence of the people, settings and performances of the era.",
    tags: ["culture"],
    sources: ["cornell-conzo"],
  },
  {
    id: "ernie-paniccioli-archive",
    when: "1985",
    title: "Ernie Paniccioli documents hip-hop's visual identity",
    text: "Photographer Ernie Paniccioli recorded hip-hop artists, performances and communities over decades as the music expanded. Cornell University's Hip Hop Collection preserves his archive, with thousands of digitized photographs. Alongside Joe Conzo Jr.'s work, these images show how photography documented the culture's development.",
    tags: ["culture"],
    sources: ["cornell-archives"],
  },
  {
    id: "the-message-registry",
    when: "2002",
    title: "The Message enters the National Recording Registry",
    text: "The Library of Congress selected Grandmaster Flash and the Furious Five's 1982 recording The Message for the inaugural National Recording Registry in 2002. Its selection recognized a landmark in rap's treatment of urban social conditions. The song was released twenty years earlier; 2002 marks its preservation recognition, not its debut.",
    tags: ["first", "culture"],
    sources: ["loc-message-2002"],
  },
  {
    id: "hiphop-france-arrives",
    when: "1982–1984",
    title: "Hip-hop takes root in France",
    text: "Hip-hop reached French audiences through music, dance and visual culture in the early 1980s. Breakers gathered at the Trocadéro and graffiti writers worked across Paris as the movement developed its own local language. The scenes that followed would help establish a lasting French-language rap tradition.",
    tags: ["culture"],
  },
  {
    id: "defjam-visual-identity",
    when: "1984–1989",
    title: "Graphic design becomes central to rap's identity",
    text: "As rap labels developed recognizable visual identities, album sleeves, promotional photography, logos and clothing helped distinguish artists. Designer Cey Adams, Def Jam's founding creative director, helped define this graphic language. The Smithsonian's hip-hop anthology includes Adams's designs and documents the visual history of the genre.",
    tags: ["culture", "business"],
    sources: ["smithsonian-anthology"],
  },
  {
    id: "pen-pixel-founded",
    when: "1992",
    title: "Pen & Pixel develops a new Southern cover aesthetic",
    text: "Brothers Shawn and Aaron Brauch founded Houston's Pen & Pixel Graphics. Its digitally assembled portraits, metallic lettering, jewelry, cars and fantastical settings became closely associated with Southern independent rap, especially No Limit and Cash Money. The University of Houston preserves a collection of the firm's original materials.",
    tags: ["culture", "tech", "business"],
    sources: ["houston-penpixel"],
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
  { id: "loc-message-2002", title: "Library of Congress — 2002 National Recording Registry: The Message", url: "https://www.loc.gov/programs/national-recording-preservation-board/recording-registry/registry-by-induction-years/2002/" },
  { id: "smithsonian-represent", title: "Smithsonian NMAAHC — Represent: women and identity in hip-hop", url: "https://nmaahc.si.edu/explore/exhibitions/represent" },
  { id: "cornell-conzo", title: "Cornell University Library — Joe Conzo Jr. Archive", url: "https://digital.library.cornell.edu/collections/conzo" },
  { id: "cornell-flyers", title: "Cornell University Library — Hip Hop Party and Event Flyers", url: "https://dcp-production-container.library.cornell.edu/collections/hiphopflyers" },
  { id: "cornell-archives", title: "Cornell Hip Hop Collection — Digital collections", url: "https://hiphop.library.cornell.edu/digital-collections/" },
  { id: "houston-penpixel", title: "University of Houston Libraries — Pen & Pixel Graphics, Inc. Records", url: "https://findingaids.lib.uh.edu/repositories/2/resources/8" },
  { id: "smithsonian-anthology", title: "Smithsonian — Anthology of Hip-Hop and Rap", url: "https://nmaahc.si.edu/explore/publications/smithsonian-anthology-hip-hop-and-rap" },
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
