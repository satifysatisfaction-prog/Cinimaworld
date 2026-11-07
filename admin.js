const firebaseConfig={
apiKey:"AIzaSyADPqo8kN2MgU68IZbT4jVQ4vCE9HAH2i4",
authDomain:"ciniworld2-65cfe.firebaseapp.com",
databaseURL:"https://ciniworld2-65cfe-default-rtdb.firebaseio.com",
projectId:"ciniworld2-65cfe",
storageBucket:"ciniworld2-65cfe.firebasestorage.app",
messagingSenderId:"8302620300",
appId:"1:8302620300:web:e7157abfd67fd50daed5a9"
};
let db=null,movies={},promotions={};
try{
if(firebaseConfig.apiKey!=="YOUR_API_KEY"){
firebase.initializeApp(firebaseConfig);db=firebase.database();
db.ref("movies").on("value",snap=>{movies=snap.val()||{};renderMovies();updateDashboard()},error=>showAlert(error.message));
db.ref("promotions").on("value",snap=>{promotions=snap.val()||{};renderBanners();updateDashboard()},error=>showAlert(error.message));
}
}catch(error){console.error(error)}
function checkDB(){if(!db){showAlert("Please configure your database settings first.");return false}return true}
function showPage(page,btn){
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById(page).classList.add("active");
document.querySelectorAll(".sidebar button").forEach(b=>b.classList.remove("active"));
if(btn)btn.classList.add("active");
document.getElementById("sidebar").classList.remove("open");
}
function toggleMenu(){document.getElementById("sidebar").classList.toggle("open")}
function toggleTheme(){
document.body.classList.toggle("light");
localStorage.setItem("cwTheme",document.body.classList.contains("light")?"light":"dark");
}
if(localStorage.getItem("cwTheme")==="light")document.body.classList.add("light");
let alertTimer;
function showAlert(message){
const el=document.getElementById("alert");el.textContent=message;el.style.display="block";
clearTimeout(alertTimer);alertTimer=setTimeout(()=>{el.style.display="none"},3000);
}
function updateDashboard(){
document.getElementById("movieCount").textContent=Object.keys(movies).length;
document.getElementById("promotionCount").textContent=Object.keys(promotions).length;
const active=Object.values(promotions).filter(p=>p&&p.status===true).length;
document.getElementById("activeCount").textContent=active;
const adStatus=document.getElementById("adStatus");adStatus.textContent=active>0?"ON":"OFF";adStatus.className=active>0?"status":"off";
}
function openMovieModal(id=null){
document.getElementById("movieForm").reset();document.getElementById("movieId").value=id||"";
document.getElementById("posterPreview").style.display="none";
if(id&&movies[id]){
const m=movies[id];
document.getElementById("title").value=m.title||"";
document.getElementById("description").value=m.description||"";
document.getElementById("category").value=m.category||"";
document.getElementById("language").value=m.language||"";
document.getElementById("tags").value=(m.tags||[]).join(", ");
document.getElementById("poster").value=m.poster||"";
document.getElementById("video").value=m.video||"";previewPoster();
}
document.getElementById("movieModalTitle").textContent=id?"Edit Movie":"Add Movie";
document.getElementById("movieModal").classList.add("show");
}
function previewPoster(){
const url=document.getElementById("poster").value,img=document.getElementById("posterPreview");
if(url){img.src=url;img.style.display="block";img.onerror=()=>img.style.display="none"}else img.style.display="none";
}
document.getElementById("movieForm").addEventListener("submit",async e=>{
e.preventDefault();if(!checkDB())return;
const id=document.getElementById("movieId").value;
const data={
title:document.getElementById("title").value.trim(),
description:document.getElementById("description").value.trim(),
category:document.getElementById("category").value,
language:document.getElementById("language").value.trim(),
tags:document.getElementById("tags").value.split(",").map(t=>t.trim()).filter(Boolean),
poster:document.getElementById("poster").value.trim(),
video:document.getElementById("video").value.trim(),updatedAt:Date.now()
};
try{if(id)await db.ref("movies/"+id).update(data);else{data.createdAt=Date.now();await db.ref("movies").push(data)}
closeModal("movieModal");showAlert("Movie saved successfully!");
}catch(err){showAlert(err.message)}
});
function renderMovies(){
const list=document.getElementById("movieList"),search=document.getElementById("movieSearch").value.toLowerCase();list.innerHTML="";
Object.entries(movies).forEach(([id,m])=>{
if(!m||!(m.title||"").toLowerCase().includes(search))return;
const card=document.createElement("div");card.className="movie-card";
const img=document.createElement("img");img.src=m.poster||"";img.alt=m.title||"Movie poster";
const heading=document.createElement("h3");heading.textContent=m.title||"Untitled";
const details=document.createElement("small");details.textContent=(m.category||"")+" • "+(m.language||"");
const actions=document.createElement("div");actions.className="actions";
const edit=document.createElement("button");edit.textContent="Edit";edit.onclick=()=>openMovieModal(id);
const del=document.createElement("button");del.textContent="Delete";del.className="danger";del.onclick=()=>deleteMovie(id);
actions.append(edit,del);card.append(img,heading,details,actions);list.append(card);
});
}
async function deleteMovie(id){
if(!checkDB()||!confirm("Delete this movie?"))return;
try{await db.ref("movies/"+id).remove();showAlert("Movie deleted!")}catch(err){showAlert(err.message)}
}
function openBannerModal(id=null){
document.getElementById("bannerForm").reset();document.getElementById("bannerId").value=id||"";
if(id&&promotions[id]){
const b=promotions[id];document.getElementById("bannerImage").value=b.image||"";
document.getElementById("bannerLink").value=b.link||"";
document.getElementById("bannerStatus").value=String(b.status===true);
}
document.getElementById("bannerModalTitle").textContent=id?"Edit Promotion":"Add Promotion";
document.getElementById("bannerModal").classList.add("show");
}
document.getElementById("bannerForm").addEventListener("submit",async e=>{
e.preventDefault();if(!checkDB())return;
const id=document.getElementById("bannerId").value;
const data={image:document.getElementById("bannerImage").value.trim(),link:document.getElementById("bannerLink").value.trim(),status:document.getElementById("bannerStatus").value==="true",updatedAt:Date.now()};
try{if(id)await db.ref("promotions/"+id).update(data);else{data.createdAt=Date.now();await db.ref("promotions").push(data)}
closeModal("bannerModal");showAlert("Promotion saved!");
}catch(err){showAlert(err.message)}
});
function renderBanners(){
const list=document.getElementById("bannerList");list.innerHTML="";
Object.entries(promotions).forEach(([id,b])=>{
if(!b)return;
const card=document.createElement("div");card.className="banner-card";
const img=document.createElement("img");img.src=b.image||"";img.alt="Promotion";
const heading=document.createElement("h3");heading.textContent=b.status?"ACTIVE":"INACTIVE";heading.className=b.status?"status":"off";
const actions=document.createElement("div");actions.className="actions";
const edit=document.createElement("button");edit.textContent="Edit";edit.onclick=()=>openBannerModal(id);
const del=document.createElement("button");del.textContent="Delete";del.className="danger";del.onclick=()=>deleteBanner(id);
actions.append(edit,del);card.append(img,heading,actions);list.append(card);
});
}
async function deleteBanner(id){
if(!checkDB()||!confirm("Delete this promotion?"))return;
try{await db.ref("promotions/"+id).remove();showAlert("Promotion deleted!")}catch(err){showAlert(err.message)}
}
function closeModal(id){document.getElementById(id).classList.remove("show")}
async function exportData(){
if(!checkDB())return;
try{
const snap=await db.ref("/").once("value");
const blob=new Blob([JSON.stringify(snap.val()||{},null,2)],{type:"application/json"});
const url=URL.createObjectURL(blob),a=document.createElement("a");
a.href=url;a.download="cineworld-backup.json";a.click();URL.revokeObjectURL(url);showAlert("Database exported!");
}catch(err){showAlert(err.message)}
}
async function importData(){
if(!checkDB())return;
const file=document.getElementById("importFile").files[0];
if(!file){showAlert("Select a JSON file.");return}
if(!confirm("This replaces the current database. Continue?"))return;
try{
const data=JSON.parse(await file.text());
if(!data||typeof data!=="object"||Array.isArray(data))throw new Error("Invalid JSON");
await db.ref("/").set(data);showAlert("Database imported!");
}catch(err){showAlert("Import failed: "+err.message)}
}
function resetLocal(){
if(!confirm("Reset local theme settings?"))return;
localStorage.removeItem("cwTheme");location.reload();
}
