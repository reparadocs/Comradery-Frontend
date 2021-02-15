const ytRegEx = /^(?:https?:\/\/)?(?:i\.|www\.|img\.)?(?:youtu\.be\/|youtube\.com\/|ytimg\.com\/)(?:embed\/|v\/|vi\/|vi_webp\/|watch\?v=|watch\?.+&v=)((\w|-){11})(?:\S+)?$/;
const vmRegEx = /https?:\/\/(?:vimeo\.com\/|player\.vimeo\.com\/)(?:video\/|(?:channels\/staffpicks\/|channels\/)|)((\w|-){7,9})/;
const spRegEx = /https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|playlist\/|\?uri=spotify:track:)((\w|-){22})/;
const scRegEx = /https?:\/\/(?:w\.|www\.|)(?:soundcloud\.com\/)(?:(?:player\/\?url=https\%3A\/\/api.soundcloud.com\/tracks\/)|)(((\w|-)[^A-z]{7})|([A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*(?!\/sets(?:\/|$))(?:\/[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*){1,2}))/;

const getIDfromRegEx = (src, regExpy) =>
  src.match(regExpy) ? RegExp.$1 : null;

export const getAllLinksFromContent = (content) => {
  const links = content.match(/href="(.*?)"/g);

  if (links) {
    return links.map((href) => href.match(/"([^"]+)"/)[1]);
  }

  return [];
};

export const getYoutubeLinks = (links) =>
  links.filter((link) =>
    /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/.test(link)
  );

export const getSpotifyLinks = (links) =>
  links.filter((link) =>
    /^(http(s)?:\/\/)?(open.)?spotify?(\.com)?\/.+/.test(link)
  );

export const getSoundcloudLinks = (links) =>
  links.filter((link) =>
    /^(http(s)?:\/\/)?((w){3}.)?soundcloud?(\.com)?\/.+/.test(link)
  );

export const getWistiaLinks = (links) =>
  links.filter((link) =>
    /https?:\/\/(.+)?(wistia\.(com|net)|wi\.st)\/(medias|embed)\/.*/.test(link)
  );

export const getYoutubeID = (src) => getIDfromRegEx(src, ytRegEx);
export const getYoutubeUrl = (ID) => 'https://www.youtube.com/watch?v=' + ID;
export const getVimeoID = (src) => getIDfromRegEx(src, vmRegEx);
export const getVimeoUrl = (ID) => 'http://vimeo.com/' + ID;
export const getSpotifyID = (src) => getIDfromRegEx(src, spRegEx);
export const getSpotifyUrl = (ID) => 'http://open.spotify.com/track/' + ID;
export const getSoundcloudID = (src) => getIDfromRegEx(src, scRegEx);
export const getSoundcloudUrl = (url) =>
  `https://w.soundcloud.com/player/?url=${url}`;
