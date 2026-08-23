import fs from 'fs';

let content = fs.readFileSync('src/components/PvpGameScreen.tsx', 'utf8');

const uiReplacement = `
                  <div className="relative group w-full max-w-lg mb-4">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                      {3 - (isPlayer1 ? dbData?.player1Guesses : dbData?.player2Guesses) || 0} {t('guessesLeft', uiLanguage)}
                    </span>
                    <span className="text-[10px] text-red-500 uppercase tracking-widest font-bold">
                      {t('opponent', uiLanguage)}: {(isPlayer1 ? dbData?.player2Guesses : dbData?.player1Guesses) || 0}/3
                    </span>
                  </div>
                  <div className="relative">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    disabled={(isPlayer1 ? dbData?.player1Guesses : dbData?.player2Guesses) >= 3}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowOptions(true);
                    }}
                    onFocus={() => setShowOptions(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        handleGuessSubmit(searchQuery);
                      }
                    }}
                    placeholder={
                      (isPlayer1 ? dbData?.player1Guesses : dbData?.player2Guesses) >= 3 
                        ? (t('outOfGuesses', uiLanguage) as string) 
                        : (t('placeholder', uiLanguage) as string)
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl py-5 pl-14 pr-32 text-lg outline-none transition-all placeholder:text-neutral-600 text-neutral-100"
                  />
                  <button 
                    disabled={(isPlayer1 ? dbData?.player1Guesses : dbData?.player2Guesses) >= 3}
                    onClick={() => {
                      if (searchQuery.trim()) {
                        handleGuessSubmit(searchQuery);
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2.5 bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 text-neutral-100 rounded-lg text-sm font-bold uppercase tracking-[0.1em] transition-colors"
                  >
                    {t('guessBtn', uiLanguage)}
                  </button>
                  </div>

                  {/* Skip Button */}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleSkip}
                      disabled={isPlayer1 ? dbData?.player1Skip : dbData?.player2Skip}
                      className="px-6 py-2.5 bg-neutral-800/50 border border-neutral-800 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-400 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-colors flex items-center gap-2"
                    >
                      <FastForward className="w-3 h-3" />
                      {(isPlayer1 ? dbData?.player1Skip : dbData?.player2Skip) 
                        ? (t('waitingSkip', uiLanguage) as string) 
                        : (t('skipBoth', uiLanguage) as string)}
                    </button>
                  </div>
`;

content = content.replace(
  `                <div className="relative group w-full max-w-lg">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowOptions(true);
                    }}
                    onFocus={() => setShowOptions(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        handleGuessSubmit(searchQuery);
                      }
                    }}
                    placeholder={t('placeholder', uiLanguage)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl py-5 pl-14 pr-32 text-lg outline-none transition-all placeholder:text-neutral-600 text-neutral-100"
                  />
                  <button 
                    onClick={() => {
                      if (searchQuery.trim()) {
                        handleGuessSubmit(searchQuery);
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg text-sm font-bold uppercase tracking-[0.1em] transition-colors"
                  >
                    {t('guessBtn', uiLanguage)}
                  </button>`,
  uiReplacement
);

// Add Chat below controls
const chatReplacement = `
        </div>
        
        {/* Chat Section */}
        <div className="w-full max-w-2xl bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 mt-4">
          <div className="flex flex-col space-y-2 mb-4 h-32 overflow-y-auto custom-scrollbar">
            {dbData?.chat?.map((c: any) => (
              <div key={c.id} className={\`flex \${c.sender === (isPlayer1 ? 'p1' : 'p2') ? 'justify-end' : 'justify-start'}\`}>
                <div className={\`px-4 py-2 rounded-2xl max-w-[80%] text-sm \${c.sender === (isPlayer1 ? 'p1' : 'p2') ? 'bg-emerald-500/20 text-emerald-100 rounded-br-sm' : 'bg-neutral-800 text-neutral-100 rounded-bl-sm'}\`}>
                  {c.msg}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendChat} className="relative">
            <input
              type="text"
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              placeholder={t('chatPlaceholder', uiLanguage) as string}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500/50 rounded-xl py-3 pl-4 pr-12 text-sm outline-none transition-colors text-neutral-100"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-emerald-400 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
`;

content = content.replace(
  `        </div>
      </div>
    </div>
  );
};`,
  chatReplacement
);

fs.writeFileSync('src/components/PvpGameScreen.tsx', content, 'utf8');
