export interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({
  title = 'Personal Execution & Balance System',
  subtitle = 'User defines → System organizes → User executes → System learns → Plan improves',
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-container">
        <h1 className="app-title">{title}</h1>
        <p className="app-subtitle">{subtitle}</p>
      </div>
    </header>
  )
}
