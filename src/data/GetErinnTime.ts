export const function GetErinnTime(){RealityTime = (Hours*60+Minutes)*60+Seconds+Milliseconds/1000;
export const ErinnTime = Math.floor(RealityTime*40);
export const ErinnSeconds = ErinnTime%60;
export const ErinnMinutes = (ErinnTime-ErinnSeconds)/60%60;
export const ErinnHours = (ErinnTime-ErinnSeconds-ErinnMinutes*60)/3600%24;
