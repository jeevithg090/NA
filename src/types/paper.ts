/** A raw entry as scraped from the library portal (see `data/all_papers.json`). */
export interface RawPaper {
  path: string[];
  name: string;
  url: string;
}

/** A cleaned, categorised question paper. */
export interface Paper {
  /** Original folder path on the library portal, e.g. `["2022", "June 2022", "IV Sem", "CSE"]`. */
  path: string[];
  /** Display name derived from the file name. */
  name: string;
  /** Direct link to the PDF. */
  url: string;
  year: string;
  term: string;
  /** e.g. `B.Tech`, `M.Tech`. */
  programme?: string;
  /** e.g. `IV Sem`. */
  semester?: string;
  /** Normalised branch name, e.g. `CSE`. */
  branch?: string;
  /** Subject name derived from the file name, when one can be inferred. */
  subject?: string;
  /** Stable identifier, unique within a dataset. */
  id: string;
}
