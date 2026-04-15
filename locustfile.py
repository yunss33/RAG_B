from locust import HttpUser, task, between

class APIUser(HttpUser):
    wait_time = between(1, 3)  # 每个用户在请求之间等待1-3秒
    
    @task
    def test_healthz(self):
        """测试健康检查端点"""
        self.client.get("/healthz")
    
    @task(3)  # 权重为3，意味着这个任务会比其他任务执行更频繁
    def test_projects(self):
        """测试获取项目列表端点"""
        self.client.get("/projects")
    
    @task(2)
    def test_search(self):
        """测试搜索端点"""
        self.client.post("/projects/test-project/search", json={
            "query": "测试搜索",
            "limit": 5,
            "type": "all",
            "threshold": 0.0
        })
