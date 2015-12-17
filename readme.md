## Ingress IITC NotifyBot

服务器端请下载代码之后使用composer部署(具体请参考lumen文档),然后运行`php artisan migrate`导入数据库.

## 使用方法

public目录下的notify-bot.user.js是实现监控comm然后自动发消息的IITC插件.

请准备一个随机字符串做为key,用数据库工具写到数据库的keys表跟messages表里面.

然后在浏览器安装那个插件并将地图定位到你想监控的区域.

修改IITC的代码`window.MAX_IDLE_TIME = 15*60`改为`window.MAX_IDLE_TIME = 60*60*24*30`(因为在IITC的插件里没能控制IITC默认的超时时间).

刷新intel地图之后会在IITC的右边出现NotifyBot的链接,点击之后写入上面的KEY就可以了
