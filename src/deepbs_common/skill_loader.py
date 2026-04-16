from __future__ import annotations

import os
from typing import Optional


class SkillLoader:
    """技能加载器，用于加载和管理技能文件"""
    
    def __init__(self):
        self.skills_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "skills")
        self.superpowers_plus_dir = os.path.join(self.skills_dir, "superpowers-plus")
    
    def load_superpowers_plus(self, compressed: bool = True) -> Optional[str]:
        """加载Superpowers Plus技能文件
        
        Args:
            compressed: 是否加载压缩版本
            
        Returns:
            技能文件内容，如果文件不存在则返回None
        """
        try:
            if compressed:
                file_path = os.path.join(self.superpowers_plus_dir, "README.compressed.md")
            else:
                file_path = os.path.join(self.superpowers_plus_dir, "README.md")
            
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    return f.read()
            return None
        except Exception as e:
            print(f"Error loading Superpowers Plus skill: {e}")
            return None
    
    def is_superpowers_plus_available(self) -> bool:
        """检查Superpowers Plus技能是否可用
        
        Returns:
            bool: 如果技能文件存在则返回True
        """
        compressed_path = os.path.join(self.superpowers_plus_dir, "README.compressed.md")
        regular_path = os.path.join(self.superpowers_plus_dir, "README.md")
        return os.path.exists(compressed_path) or os.path.exists(regular_path)


# 创建全局技能加载器实例
skill_loader = SkillLoader()
