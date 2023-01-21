import { useEffect, useState } from 'react'
import * as CheckBox from '@radix-ui/react-checkbox'
import { Check } from 'phosphor-react'
import dayjs from 'dayjs'

import { api } from '../lib/axios'

interface iHabitsListProps {
   date: Date
   onCompletedChanged: (completed: number) => void
}

interface iHabitsInfo {
   possibleHabits: {
      id: string
      title: string
      created_at: string
   }[]
   completedHabits: string[]
}

function HabitsList({ date, onCompletedChanged } : iHabitsListProps) {
   const [ habitsInfo, setHabitsInfo ] = useState<iHabitsInfo>()

   useEffect(()=> {
      api.get('day', {
         params: {
            date: date.toISOString()
         }
      }).then(response => setHabitsInfo(response.data))
   },[])

   const isDateinPast = dayjs(date).endOf('day').isBefore(new Date())

   async function handleToggleHabit(habitId: string) {
      await api.patch(`habits/${habitId}/toggle`)

      const isHabitAlreadyCompleted = habitsInfo!.completedHabits.includes(habitId)

      let completedHabits : string[] = [] 

      if(isHabitAlreadyCompleted) {
         completedHabits = habitsInfo!.completedHabits.filter(id => id !== habitId)
      } else {
         completedHabits = [...habitsInfo!.completedHabits, habitId]
      }

      setHabitsInfo({
         possibleHabits: habitsInfo!.possibleHabits,
         completedHabits
      })

      onCompletedChanged(completedHabits.length)
      
   }

   return (
      <div className='mt-6 flex flex-col gap-3'>
         {habitsInfo?.possibleHabits.map(habit =>{
            return (
               <CheckBox.Root 
                  className='flex items-center gap-3 group focus:outline-none disabled:cursor-not-allowed'
                  key={habit.id}
                  onCheckedChange={() => handleToggleHabit(habit.id)}
                  checked={habitsInfo.completedHabits.includes(habit.id)}
                  disabled={isDateinPast}
               >
                  <div className='h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 transition-colors group-focus:outline-none group-focus:ring-2 group-focus:ring-violet-500 group-focus:ring-offset-2 group-focus:ring-offset-background'>
                     <CheckBox.Indicator>
                        <Check size={20} className='text-white'/>
                     </CheckBox.Indicator>
                  </div>
                  <span className='font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400'>
                     {habit.title}
                  </span>
               </CheckBox.Root>  
            )
         })}
      </div>
   )
   
}

export { HabitsList }