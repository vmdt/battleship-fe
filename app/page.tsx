'use client'

import Pannel from '@/components/Pannel'
import HomeLayout from '@/layouts/default'
import { GameCardModel } from '@/models'
import GameList from '@/partials/home/game-list'
import { useSocketStore } from '@/stores/socketStore'
import { useLocale, useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations()
  const locale = useLocale()
  const { connect, getSocket } = useSocketStore()

  // Connect to the socket for the home namespace
  if (!getSocket('user')) {
    // connect('user')
  }

  const games = [
    {
      title: t('games.battleship'),
      image: 'https://papergames.io/en/assets/games/battleships/thumbnail.png',
      url: '/battleship'
    },
    {
      title: t('games.tictactoe'),
      image: 'https://papergames.io/en/assets/games/tictactoe/thumbnail.png',
      url: '/tictactoe'
    }
  ] as GameCardModel[]

  return (
    <HomeLayout>
      <Pannel>
        <div className="flex items-end gap-4 py-4">
            <h1 className="text-2xl font-luckiest mt-1">{t('common.app_title')}</h1>
        </div>
        <GameList games={games} />
      </Pannel>
    </HomeLayout>
  )
}
