
# Context-Aware Terminology Update: Protocol → Project/Platform

## Understanding the Context

Based on your clarification, we need two distinct replacements:

| Context | Current Term | New Term |
|---------|--------------|----------|
| Resilience as a product/service | "protocol" | "Platform" |
| Individual registry entries | "protocol" | "project" |

---

## Files & Changes Summary

### 1. Explorer.tsx (5 changes)
```text
Line 97:  "Browse verified protocols..."     → "Browse verified projects..."
Line 142: "...registered protocols"           → "...registered projects"
Line 172: "No Registered Protocols Yet"       → "No Registered Projects Yet"
Line 176: "No protocols match..."             → "No projects match..."
Line 177: "...register your protocol..."      → "...register your project..."
```

### 2. Dashboard.tsx (4 changes)
```text
Line 74:  "...registered protocols..."        → "...registered projects..."
Line 130: "REGISTER PROTOCOL"                 → "REGISTER PROJECT"
Line 146: "No Registered Protocols"           → "No Registered Projects"
Line 149: "Register your first protocol"      → "Register your first project"
```

### 3. ProgramDetail.tsx (4 changes)
```text
Line 79:  "PROTOCOL NOT FOUND"                → "PROJECT NOT FOUND"
Line 82:  "The protocol you're looking..."    → "The project you're looking..."
Line 93:  "Register Protocol"                 → "Register Project"
Line 103: "Unknown Protocol"                  → "Unknown Project"
```

### 4. DeleteProfileDialog.tsx (3 changes)
```text
Line 54:  "DELETE PROTOCOL"                   → "DELETE PROJECT"
Line 76:  "Type protocol name here..."        → "Type project name here..."
Line 98:  "Delete Protocol"                   → "Delete Project"
```

### 5. HeroSection.tsx (3 changes)
```text
Line 30:  "Registered Protocols"              → "Registered Projects"
Line 32:  "...claim your protocol."           → "...claim your project."
Line 33:  "Verified protocols in..."          → "Verified projects in..."
```

### 6. ClaimProfile.tsx (3 changes)
```text
Line 444: "Your protocol is now registered"   → "Your project is now registered"
Line 519: "Prove you own this protocol..."    → "Prove you own this project..."
Line 520: "Register your protocol..."         → "Register your project..."
```

### 7. Readme.tsx (15+ changes)
```text
Line 57:  "...protocol health monitoring"     → "...project health monitoring"
Line 122: "...protocol health registry"       → "...project health registry"
Line 129: "...protocol's true resilience"     → "...project's true resilience"
Line 139: "...investing in protocols"         → "...investing in projects"
Line 145: "Protocol Builders"                 → "Project Builders"
Line 166: "...no protocol receives..."        → "...no project receives..."
Line 293: "...DeFi protocols..."              → "...DeFi projects..."
Line 296: "...stake in protocol"              → "...stake in project"
Line 370: "For Protocol Builders"             → "For Project Builders"
Line 537: "...prove your protocol's..."       → "...prove your project's..."
Line 550: "Browse Protocols"                  → "Browse Projects"
```

### 8. UseCasesSection.tsx (2 changes)
```text
Line 8:   "PROTOCOL RISK"                     → "PROJECT RISK"
Line 10:  "DeFi protocols need to..."         → "DeFi projects need to..."
```

### 9. EcosystemHeatmap.tsx (1 change)
```text
Line 182: "No protocols match..."             → "No projects match..."
```

### 10. TVLMetricsCard.tsx (1 change)
```text
Line 31:  "Not a DeFi protocol..."            → "Not a DeFi project..."
```

### 11. RoadmapManagement.tsx (2 changes)
```text
Line 151: "...your protocol's progress"       → "...your project's progress"
Line 357: "...your protocol roadmap"          → "...your project roadmap"
```

### 12. TeamManagement.tsx (2 changes)
```text
Line 251: "...building this protocol"         → "...building this project"
Line 520: "Our protocol solves..."            → "Our project solves..."
```

### 13. BondSummary.tsx (1 change)
```text
Line 125: "The protocol does not..."          → "The project does not..."
```

### 14. TeamTabContent.tsx (2 changes)
```text
Line 54:  "The team behind this protocol..."  → "The team behind this project..."
Line 186: "The team behind this protocol..."  → "The team behind this project..."
```

---

## Technical Notes

- **Prop names unchanged**: Internal TypeScript prop names like `protocolName` remain unchanged to avoid breaking changes. Only displayed text is updated.
- **Case sensitivity**: Using lowercase "project" in sentence context (e.g., "your project") and uppercase "PROJECT" in headers/buttons.
- **No database changes**: This is purely a UI terminology update.
- **Total changes**: ~45 text replacements across 14 files.

---

## Summary

| Metric | Count |
|--------|-------|
| Files to modify | 14 |
| Text replacements | ~45 |
| Breaking changes | 0 |
