import type { SkillLevel } from '@/lib/app-data'
import { SkillChip } from '@/components/site/avatar'
import { ProgressBar } from './widget-card'

export function SkillsSummary({ skills, learning }: { skills: SkillLevel[]; learning: string[] }) {
  return (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col gap-4">
        {skills.map((skill) => (
          <li key={skill.name} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{skill.name}</span>
              <span className="tabular-nums text-muted-foreground">{skill.level}%</span>
            </div>
            <ProgressBar value={skill.level} label={`${skill.name} proficiency`} />
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Looking to learn</p>
        <ul className="flex flex-wrap gap-1.5">
          {learning.map((goal) => (
            <li key={goal}>
              <SkillChip variant="brand">{goal}</SkillChip>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
