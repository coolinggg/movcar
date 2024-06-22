import { DEBUG } from "cc/env";

export var ServerConfig = {
    version: "1.0.0",
    // root_url: `http://localhost:8061`,
    root_url: ``,
    cdn_url: ``,
    ip_api: `-8`,
    ip_query: "",
    config_url: `config.json`,
    is_local_game: true,
    openId: "aliwangzai5",
    /**锟角凤拷锟斤拷锟斤拷锟斤拷陆锟斤拷锟斤拷  */
    is_normal_login: true,

}
if (DEBUG) {
    ServerConfig.is_local_game = true;
}
ServerConfig.cdn_url = `${ServerConfig.cdn_url}/${ServerConfig.version}/`
ServerConfig.config_url = ServerConfig.cdn_url + ServerConfig.config_url
// tmxLoader.baseUrl = ServerConfig.cdn_url + "cloud-levels/"
