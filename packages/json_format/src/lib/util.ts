import URLType from "../types/URLtype"

export const getUrlType = (url: string): URLType => {

  if (url.match(/\.(pdf|png|jpg|jpeg|docx|xlsx|pptx|zip|txt|mp3|mp4|avi|mov|gif|html|css|js)$/i))
    return 'file';

  if (url.startsWith('http://') || url.startsWith('https://'))
    return 'web_page';

  return 'unknown'
}

