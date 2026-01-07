import { Md5 } from 'ts-md5';

export function hashUrl(originalUrl : string) : string {
    /*
    - The full MD5 hash is 32 hexadecimal characters long. This is often too long for a "shortened" URL.
    - The goal of URL shortening is to create a much shorter, more manageable URL.
    - substring(0, 8) takes only the first 8 characters of the hash, significantly reducing the length.
    - By truncating the hash, we introduce a higher risk of collisions (where two different URLs produce the same shortened hash).
    */
    
      // hash the url
      const hash = Md5.hashStr(originalUrl);
    
      const shortHash = hash.substring(0,8);
      return shortHash;
    }
    
    // function to check if a url is valid or not
export function isValidUrl(url: string) : boolean {
  const regexp = new RegExp('^https?://(?:[a-zA-Z0-9.-]+.)[a-zA-Z]{2,}$');
  const test = regexp.test(url);
  if (test) return true;
  else return false;
}