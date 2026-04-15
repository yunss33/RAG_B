#!/usr/bin/env python3
"""定时任务监控系统 - 测试版本（30秒间隔）"""

import asyncio
import sys
import os
import time
import logging
from datetime import datetime
from pathlib import Path

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 配置日志
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_dir / "test_monitoring_task.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("test_monitoring_task")

# 30秒测试间隔
MONITORING_INTERVAL = 30


async def test_skill_flow():
    """测试技能执行流程"""
    logger.info("=" * 60)
    logger.info("开始测试技能执行流程")
    logger.info("=" * 60)
    
    try:
        from src.deepbs_common.skill_system import skill_manager
        from src.deepbs_common.schemas import Project
        
        # 1. 创建测试项目
        logger.info("\n[1/5] 创建测试项目...")
        project = Project(
            id=f"monitoring-test-{int(time.time())}",
            name="监控测试项目",
            description="这是一个监控测试项目，用于验证系统稳定性",
            outline=[],
            outline_confirmed=False,
            config={
                "enable_image_insertion": True,
                "enable_rag": True,
            },
            source_files=[]
        )
        logger.info(f"✓ 项目创建成功: {project.name}")
        
        # 2. 执行parse_requirements
        logger.info("\n[2/5] 执行parse_requirements...")
        result = await skill_manager.execute_skill("parse_requirements", project, {})
        project = result["project"]
        logger.info(f"✓ parse_requirements执行成功，需求数量: {len(project.requirements)}")
        
        # 3. 执行plan_outline
        logger.info("\n[3/5] 执行plan_outline...")
        result = await skill_manager.execute_skill("plan_outline", project, {})
        project = result["project"]
        logger.info(f"✓ plan_outline执行成功，章节数量: {len(project.outline)}")
        
        # 4. 执行write_drafts
        logger.info("\n[4/5] 执行write_drafts...")
        result = await skill_manager.execute_skill("write_drafts", project, {})
        project = result["project"]
        logger.info(f"✓ write_drafts执行成功，草稿数量: {len(project.drafts)}")
        
        logger.info("\n" + "=" * 60)
        logger.info("✓ 所有技能执行成功！")
        logger.info("=" * 60)
        return True
        
    except Exception as e:
        logger.error(f"✗ 技能执行流程测试失败: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False


def check_backend_service():
    """检查后端服务是否正常运行"""
    logger.info("检查后端服务状态...")
    try:
        import requests
        response = requests.get("http://localhost:8103/healthz", timeout=10)
        if response.status_code == 200:
            logger.info("✓ 后端服务运行正常")
            return True
        else:
            logger.error(f"✗ 后端服务响应异常: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"✗ 无法连接到后端服务: {e}")
        return False


def check_frontend_service():
    """检查前端服务是否正常运行"""
    logger.info("检查前端服务状态...")
    try:
        import requests
        response = requests.get("http://localhost:5175/", timeout=10)
        if response.status_code == 200:
            logger.info("✓ 前端服务运行正常")
            return True
        else:
            logger.error(f"✗ 前端服务响应异常: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"✗ 无法连接到前端服务: {e}")
        return False


async def run_monitoring_cycle():
    """运行一个监控周期"""
    logger.info("\n" + "=" * 80)
    logger.info(f"开始监控周期 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 80)
    
    success = True
    
    # 1. 检查后端服务
    if not check_backend_service():
        success = False
    
    # 2. 检查前端服务
    if not check_frontend_service():
        success = False
    
    # 3. 测试技能执行流程
    if not await test_skill_flow():
        success = False
    
    logger.info("\n" + "=" * 80)
    if success:
        logger.info(f"✓ 监控周期完成 - 所有检查通过 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    else:
        logger.error(f"✗ 监控周期完成 - 存在问题 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 80)
    
    return success


async def main():
    """主函数 - 持续运行监控任务"""
    logger.info("=" * 80)
    logger.info("投标文档生成系统 - 定时任务监控系统（测试版本）")
    logger.info("=" * 80)
    logger.info(f"监控间隔: {MONITORING_INTERVAL}秒")
    logger.info(f"开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 80)
    
    cycle_count = 0
    
    while True:
        cycle_count += 1
        logger.info(f"\n\n开始第 {cycle_count} 个监控周期")
        
        try:
            await run_monitoring_cycle()
        except Exception as e:
            logger.error(f"监控周期执行异常: {e}")
            import traceback
            logger.error(traceback.format_exc())
        
        if cycle_count >= 2:
            logger.info("\n\n测试完成，运行了2个监控周期")
            break
        
        # 等待下一个监控周期
        logger.info(f"\n等待 {MONITORING_INTERVAL} 秒后开始下一个监控周期...")
        logger.info(f"预计下一次运行时间: {datetime.fromtimestamp(time.time() + MONITORING_INTERVAL).strftime('%Y-%m-%d %H:%M:%S')}")
        
        await asyncio.sleep(MONITORING_INTERVAL)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("\n\n监控任务被用户中断")
        logger.info(f"结束时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        sys.exit(0)
    except Exception as e:
        logger.error(f"监控任务异常退出: {e}")
        import traceback
        logger.error(traceback.format_exc())
        sys.exit(1)
