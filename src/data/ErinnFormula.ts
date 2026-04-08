export const SkillNow = 0;
export const function OnloadFunction(){SkillLists()}function SkillLists(){t = "<table bordercolor=black cellspacing=0 border=1 style='text-align:center,margin:auto,font-size:10,' bgColor=black Width=378><tr><td colspan=3 bgColor=gold id=SkillListKey></td></tr></table><br><table bordercolor=black cellspacing=0 border=1 style='text-align:center,margin:auto,' bgColor=black><tr>";
export const for(i = 0;
export const i++){t+ = "<td onmouseover='MouseOver(this)' onmouseout='MouseOut(this)' width=121 id=Skill"+SkillList[i]+" onclick='ChangeSkill("+SkillList[i]+")'><img src='img/Skill/"+SkillList[i]+".png'><br><font size='2'>"+eval("Skill"+SkillList[i]+"[0]")+"</font></td>";
export const if(i % 3 = = 2){t+= "</tr><tr>"}}t+= "</tr></table><table bordercolor=black cellspacing=0 border=1 style='text-align:center,margin:auto,' bgColor=black><tr>";
export const t+ = "<td onmouseover='MouseOver(this)' onmouseout='MouseOut(this)' width=150 id=ErgEnhance onclick='ChangeSkill(&quot,ErgEnhance&quot,)'>"+ErgEnhance[0]+"</font></td>";
export const document.getElementById("Skill").innerHTML = t}function MouseOver(obj){obj.style = "border:1px solid gold,"}function MouseOut(obj){obj.style = "border:1px solid #000000,"};
