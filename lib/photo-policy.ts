export const PHOTO_LIMIT=8*1024*1024;
export const PHOTO_TYPES=['image/jpeg','image/png','image/webp'];
export function validPhotoMeta(b:any){return typeof b.task==='string'&&b.task.length<=150&&typeof b.name==='string'&&b.name.length>0&&b.name.length<=240&&PHOTO_TYPES.includes(b.type)&&Number.isSafeInteger(b.size)&&b.size>0&&b.size<=PHOTO_LIMIT&&['before','after','legacy'].includes(b.phase);}
export function detectPhoto(bytes:Uint8Array){if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';if(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71)return 'image/png';if(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'image/webp';return '';}
