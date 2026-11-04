"use client";
export default function DeleteTypeButton({title}:{title:string}){
 return <button type="submit" className="button danger" onClick={e=>{
  if(!window.confirm("Delete cover type '"+title+"'? Covers using this type will become unclassified. This cannot be undone."))e.preventDefault();
 }}>✕ Delete type</button>;
}
