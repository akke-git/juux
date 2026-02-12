export type ServiceItem = {
  name: string;
  icon: string;
  url: string;
};

export const services: ServiceItem[] = [
  { name: "NPM", icon: "/images/nginx.png", url: "http://juux:81" },
  { name: "Siyuan Note", icon: "/images/siyuan.png", url: "http://juux:6806" },
  { name: "Portainer", icon: "/images/port.png", url: "http://juux:9000" },
  { name: "PhotoPrism", icon: "/images/photo.png", url: "http://juux:2342" },
  { name: "FileBrowser", icon: "/images/filebrowser.png", url: "http://juux:8100" },
  { name: "NocoDB", icon: "/images/noco.png", url: "http://juux:8082" },
  { name: "Emby", icon: "/images/emby.png", url: "http://mov.juux.net" },
  { name: "Komga", icon: "/images/toon.png", url: "http://toon.juux.net" }
];
