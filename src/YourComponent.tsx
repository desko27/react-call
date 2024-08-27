import { createCallable } from '#lib/main'

export const YourComponent = createCallable<void, boolean>(
  ({ call }) => (
    <>
      <div
        className={`fixed inset-0 z-10 bg-black bg-opacity-50 animate-duration-300 ${call.ended ? 'animate-fade-out' : 'animate-fade-in'}`}
      />
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-600/10 p-6 backdrop-blur-2xl animate-duration-300 ${call.ended ? 'animate-zoom-out' : 'animate-zoom-in'}`}
          >
            <h3 className="text-base/7 font-medium text-white">
              This is your own component
            </h3>
            <p className="mt-2 text-sm/6 text-white/65">
              You provide the component to be called and specify what needs to
              be returned. Might be a boolean... or anything!
            </p>
            <div className="mt-4 space-x-4">
              <button
                className="transition-colors duration-300 rounded-md bg-fuchsia-700/30 py-1.5 px-3 text-sm/6 font-semibold text-white focus:outline-none hover:bg-emerald-700 focus:outline-1 focus:outline-white"
                type="button"
                onClick={() => call.end(true)}
              >
                <pre>⭕️ true</pre>
              </button>
              <button
                className="transition-colors duration-300 rounded-md bg-fuchsia-700/30 py-1.5 px-3 text-sm/6 font-semibold text-white focus:outline-none hover:bg-red-700 focus:outline-1 focus:outline-white"
                type="button"
                onClick={() => call.end(false)}
              >
                <pre>❌ false</pre>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  ),
  200,
)
