// Defaults are weekly as requested. Owners may edit the cycle for rent/utilities.
export const weeklyInspectionTitles=['광고현황','리뷰 답글','시설 상태 점검','월세 입금','전기세 및 수도세','재고파악','개선 사항','방역관리'] as const;
export function missingWeeklyPresets(definitions:any[],category:number){
 return weeklyInspectionTitles.filter(title=>!definitions.some(d=>d.category===category&&d.title.trim()===title));
}
export function inspectionSamples(){
 return Array.from({length:6},(_,category)=>weeklyInspectionTitles.map((title,i)=>({id:'preset-'+category+'-'+i,category,title,cycle:'weekly',required:false,active:true}))).flat();
}
