export function CodeBlock(): JSX.Element {
  return (
    <div className="-mx-6 self-stretch bg-slate-700 bg-opacity-50 px-6 py-5 space-y-4 overflow-auto animate-expand-horizontally animate-delay-400">
      <pre className="text-emerald-400 text-center animate-flip-in-y animate-delay-700">
        {'npm i react-call'}
      </pre>
      <pre className="text-fuchsia-400 text-center animate-flip-in-y animate-delay-1000">
        {'const '}
        <span className="text-amber-400">{'YourComponent'}</span>
        <span className="text-teal-400">{' = '}</span>
        {'createCallable('}
        <span className="text-slate-400">{'/* your code */'}</span>
        {')'}
      </pre>
    </div>
  )
}
