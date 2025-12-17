# 长思考deepseekr1模型-网页QA-开启流式输出
curl --location 'https://metaso.cn/api/v1/chat/completions' \
--header 'Authorization: Bearer mk-AF6CA8FDBBB253E6B1C757B092B9E5A1' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"model":"ds-r1","stream":true,"messages":[{"role":"user","content":"谁是这个世界上最美丽的女人"}]}'

# 文库QA
curl --location 'https://metaso.cn/api/v1/chat/completions' \
--header 'Authorization: Bearer mk-AF6CA8FDBBB253E6B1C757B092B9E5A1' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"model":"ds-r1","stream":true,"scope":"document","messages":[{"role":"user","content":"谁是这个世界上最美丽的女人"}]}'

# 学术QA
curl --location 'https://metaso.cn/api/v1/chat/completions' \
--header 'Authorization: Bearer mk-AF6CA8FDBBB253E6B1C757B092B9E5A1' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"model":"ds-r1","stream":true,"scope":"scholar","messages":[{"role":"user","content":"谁是这个世界上最美丽的女人"}]}'

# 视频
curl --location 'https://metaso.cn/api/v1/chat/completions' \
--header 'Authorization: Bearer mk-AF6CA8FDBBB253E6B1C757B092B9E5A1' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"model":"ds-r1","stream":true,"scope":"video","messages":[{"role":"user","content":"谁是这个世界上最美丽的女人"}]}'

# 博客
curl --location 'https://metaso.cn/api/v1/chat/completions' \
--header 'Authorization: Bearer mk-AF6CA8FDBBB253E6B1C757B092B9E5A1' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"model":"ds-r1","stream":true,"scope":"podcast","messages":[{"role":"user","content":"谁是这个世界上最美丽的女人"}]}'

# 急速模型-网页QA
curl --location 'https://metaso.cn/api/v1/chat/completions' \
--header 'Authorization: Bearer mk-AF6CA8FDBBB253E6B1C757B092B9E5A1' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"model":"fast","stream":true,"messages":[{"role":"user","content":"谁是这个世界上最美丽的女人"}]}'

# 急速模型思考-网页QA
curl --location 'https://metaso.cn/api/v1/chat/completions' \
--header 'Authorization: Bearer mk-AF6CA8FDBBB253E6B1C757B092B9E5A1' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"model":"fast_thinking","stream":true,"messages":[{"role":"user","content":"谁是这个世界上最美丽的女人"}]}'

# 急速模型思考-网页QA-返回精简的原文匹配信息
curl --location 'https://metaso.cn/api/v1/chat/completions' \
--header 'Authorization: Bearer mk-AF6CA8FDBBB253E6B1C757B092B9E5A1' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"model":"fast_thinking","stream":true,"conciseSnippet":true,"messages":[{"role":"user","content":"谁是这个世界上最美丽的女人"}]}'

# 读取网页，返回markdown
curl --location 'https://metaso.cn/api/v1/reader' \
--header 'Authorization: Bearer mk-AF6CA8FDBBB253E6B1C757B092B9E5A1' \
--header 'Accept: text/plain' \
--header 'Content-Type: application/json' \
--data '{"url":"https://www.163.com/news/article/K56809DQ000189FH.html"}'

# 读取网页，返回json
curl --location 'https://metaso.cn/api/v1/reader' \
--header 'Authorization: Bearer mk-AF6CA8FDBBB253E6B1C757B092B9E5A1' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"url":"https://www.163.com/news/article/K56809DQ000189FH.html"}'

# 搜索，网页，返回10条
curl --location 'https://metaso.cn/api/v1/search' \
--header 'Authorization: Bearer mk-AF6CA8FDBBB253E6B1C757B092B9E5A1' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"q":"谁是这个世界上最美丽的女人","scope":"webpage","includeSummary":false,"size":"10","includeRawContent":false,"conciseSnippet":false}'

# 搜索，网页，返回20条，返回精简的原文匹配信息，通过网页的摘要信息进行召回增强，抓取所有来源网页原文
curl --location 'https://metaso.cn/api/v1/search' \
--header 'Authorization: Bearer mk-AF6CA8FDBBB253E6B1C757B092B9E5A1' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"q":"谁是这个世界上最美丽的女人","scope":"webpage","includeSummary":true,"size":20,"includeRawContent":true,"conciseSnippet":true}'