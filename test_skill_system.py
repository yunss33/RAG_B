from deepbs_common.skill_system import skill_manager

print('Available skills:')
skills = skill_manager.get_available_skills()
for skill in skills:
    print(f'  - {skill.name}: {skill.description} (category: {skill.category})')

print('\nSkill dependencies:')
for skill in skills:
    if skill.dependencies:
        print(f'  {skill.name} depends on: {', '.join(skill.dependencies)}')
    else:
        print(f'  {skill.name} has no dependencies')
