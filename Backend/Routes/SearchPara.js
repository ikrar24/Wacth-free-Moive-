// utils/fetchSearchData.js
import fetch from "node-fetch";


export const SearchApi = async (query) => {
  const targetUrl = `https://net20.cc/search.php?s=${query}`;
  
  const cookiesJson = {"url":"...","cookies":[{"name":"HstCla1190725","value":"1760159251969"}, {"name":"HstPn1190725","value":"1"}, {"name":"HstPt1190725","value":"9"}, {"name":"HstCnv1190725","value":"2"}, {"name":"HstCns1190725","value":"2"}, {"name":"ext_name","value":"ojplmecpdpgccookcobabopnaifgidhf"}, {"name":"t_hash_t","value":"2d0cb4942d6a867c34c190529bda3e5c%3A%3A74c23456340c9e92e82f65de27784123%3A%3A1760159271%3A%3Ani"}, {"name":"user_token","value":"22222165143392746c92a6680b365ab9"}, {"name":"SE80135674","value":"82036406"}, {"name":"recentplay","value":"SE80135674"}, {"name":"82036406","value":"116%3A1432"}, {"name":"t_hash","value":"c024d23ae316710609d1bb48a10c7af4%3A%3A1760340390%3A%3Ani"}]};
  const cookieString = cookiesJson.cookies.map(c => `${c.name}=${c.value}`).join('; ');

  const response = await fetch(targetUrl, {
    headers: {
      'Cookie': cookieString,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });

  const responseText = await response.text();

  if (response.headers.get('content-type')?.includes('application/json')) {
    return JSON.parse(responseText);  // 👈 return the data
  } else {
    throw new Error("Server did not return JSON");
  }
};
