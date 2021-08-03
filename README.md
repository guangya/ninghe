#### 启动本地nginx

```bash
sudo /etc/nginx
```

### 关于数据更新的思考

以数据创建是的毫秒数作为数据的version，由于time是自增的，则无需去考虑版本号递增的问题
客户端更新后保存这个version，用来在下次更新时做校验

启用develop分支