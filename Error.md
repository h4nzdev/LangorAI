## Error Type
Runtime ReferenceError

## Error Message
Progress is not defined


    at PlayerCard (src/components/battle/PlayerCard.tsx:103:18)
    at BattleRoom (src/components/battle/BattleRoom.tsx:154:11)
    at BattlePage (src/app/battle/page.tsx:63:11)

## Code Frame
  101 |                   </span>
  102 |                 </div>
> 103 |                 <Progress 
      |                  ^
  104 |                   value={accuracy} 
  105 |                   className="h-3"
  106 |                 />

Next.js version: 15.5.9 (Turbopack)