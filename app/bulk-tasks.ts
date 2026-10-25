export const commonFields=['title','start','end','category','assignee','request'] as const;
export function commonChanges(original:any,edited:any){const changes:Record<string,any>={};for(const key of commonFields)if(original[key]!==edited[key])changes[key]=key==='title'?edited[key].trim():edited[key];return changes}
export function legacyMatch(anchor:any,t:any){return !anchor.seriesId&&!t.seriesId&&!t.sourceName&&t.title===anchor.title&&t.category===anchor.category&&t.start===anchor.start&&t.end===anchor.end&&t.assignee===anchor.assignee}
