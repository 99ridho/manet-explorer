// SPEC.md §8 and §19.0: topic nav grouped by week range, then the case studies, driven by the registries.
// The shadcn menu button has a fixed h-8; titles that wrap need the row to grow with them, and the
// badge keeps its width so the title takes the wrapping.
const ITEM = 'h-auto min-h-8 justify-between py-1.5 leading-snug'
const BADGE = 'shrink-0 font-mono text-[10px]'
import { NavLink } from 'react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { caseStudies } from '@/case-studies/registry'
import { topicsByWeek } from '@/topics/registry'

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <p className="text-sm font-medium text-muted-foreground">
          Mobile Ad-Hoc Networks
        </p>
        <div className='gap-y-2'>
          <p className="text-xs text-muted-foreground">Universitas Negeri Jakarta</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <NavLink to="/start">
                  {({ isActive }) => (
                    <SidebarMenuButton isActive={isActive} className={ITEM}>
                      <span>Start here</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {topicsByWeek().map((group) => (
          <SidebarGroup key={group.weekLabel}>
            <SidebarGroupLabel>{group.weekLabel}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.topics.map((topic) => (
                  <SidebarMenuItem key={topic.slug}>
                    <NavLink to={`/topic/${topic.slug}`}>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive} className={ITEM}>
                          <span>{topic.title}</span>
                          <Badge className={BADGE}>
                            {topic.weekLabel}
                          </Badge>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        {caseStudies.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Case Studies</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {caseStudies.map((cs) => (
                <SidebarMenuItem key={cs.slug}>
                  <NavLink to={`/case-study/${cs.slug}`}>
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive} className={ITEM}>
                        <span>{cs.title}</span>
                        <Badge className={BADGE}>{cs.weekLabel}</Badge>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="px-4 py-3">
        <p className="text-xs text-muted-foreground">
          References: Loo, Lloret &amp; Ortiz (2012), <em>Mobile Ad Hoc Networks</em>; Misra, Woungang &amp; Misra (2009),{' '}
          <em>Guide to Wireless Ad Hoc Networks</em>.
        </p>
        <p className="text-xs text-muted-foreground">
          Built by <a href='https://github.com/99ridho'>@99ridho</a> + Claude
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
