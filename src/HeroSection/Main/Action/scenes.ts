import {
  YourDialog,
  YourToast,
  YourNested,
  YourChain,
  YourUnlocked,
  YourBubbles,
} from '../../../CallableScenes'

export const DISABLED_COLORS = 'bg-gray-700 text-slate-100 hover:text-white'

const SCENES = new Map([
  [
    'YourDialog',
    {
      trigger: async () => {
        console.group('YourDialog')
        console.log('await YourDialog.call() ⏳')
        const res = await YourDialog.call()
        console.log('await YourDialog.call() ✅', '→', res)
        console.groupEnd()
        return res.toString()
      },
      buttonColors:
        'bg-emerald-700 hover:bg-emerald-600 hover:shadow-emerald-500/20 text-slate-100 hover:text-white',
    },
  ],
  [
    'YourUnlocked',
    {
      trigger: async () => {
        console.group('YourUnlocked')
        console.log('await YourUnlocked.call() ⏳')
        await YourUnlocked.call()
        console.log('await YourUnlocked.call() ✅', '→', undefined)
        console.groupEnd()
        return undefined
      },
      buttonColors:
        'bg-lime-700 hover:bg-lime-600 hover:shadow-lime-500/20 text-slate-100 hover:text-white',
    },
  ],
  [
    'YourNested',
    {
      trigger: async () => {
        console.group('YourNested')
        const lastRes = await YourNested.call({
          i: 0,
          onCallNested: (i) => {
            console.log(`await YourNested.call({ i: ${i} }) ⏳`)
          },
          onEndNested: (i, res) => {
            console.log(
              `await YourNested.call({ i: ${i} }) ✅`,
              '→',
              `'${res}'`,
            )
          },
        })
        console.groupEnd()
        return `'${lastRes}'`
      },
      buttonColors:
        'bg-pink-700 hover:bg-pink-600 hover:shadow-pink-500/20 text-slate-100 hover:text-white',
    },
  ],
  [
    'YourToast',
    {
      trigger: async () => {
        console.group('YourToast')
        console.log('await YourToast.call() ⏳')
        const res = await YourToast.call()
        console.log('await YourToast.call() ✅', '→', `'${res}'`)
        console.groupEnd()
        return `'${res}'`
      },
      buttonColors:
        'bg-blue-700 hover:bg-blue-600 hover:shadow-blue-500/20 text-slate-100 hover:text-white',
    },
  ],
  [
    'YourChain',
    {
      times: 3,
      trigger: async () => {
        console.group('YourChain')
        const resultsInArray: Awaited<ReturnType<typeof YourChain.call>>[] = []

        for await (const n of [1, 2, 3]) {
          console.log(`await YourChain.call({ n: ${n} }) ⏳`)
          const res = await YourChain.call({ n })
          resultsInArray.push(res)
          console.log(`await YourChain.call({ n: ${n} }) ✅`, '→', res)
        }

        console.log('Final array of results:')
        console.table(resultsInArray)
        console.groupEnd()
        return '[{…}, {…}, {…}]'
      },
      buttonColors:
        'bg-violet-700 hover:bg-violet-600 hover:shadow-violet-500/20 text-slate-100 hover:text-white',
    },
  ],
  [
    'YourBubbles',
    {
      trigger: async () => {
        console.group('YourBubbles')
        console.log('await YourBubbles.call() ⏳')
        const res = await YourBubbles.call()
        console.log('await YourBubbles.call() ✅', '→', `'${res}'`)
        console.groupEnd()
        return `'${res}'`
      },
      buttonColors:
        'bg-yellow-400 hover:bg-yellow-300 hover:shadow-yellow-500/20 text-black hover:text-slate-800',
    },
  ],
])

const SCENE_KEYS = [...SCENES.keys()]

export function getCurrentScene(sceneName: string) {
  // biome-ignore lint/style/noNonNullAssertion: always found
  return SCENES.get(sceneName)!
}

export function getNextScene(sceneName: string): string {
  const nextIndex = (SCENE_KEYS.indexOf(sceneName) + 1) % SCENES.size
  return SCENE_KEYS[nextIndex]
}
