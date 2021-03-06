import React, { useContext } from 'react'
import { useApolloClient } from '@apollo/react-hooks'
import Utils from 'web3-utils'
import Button from '../Button'
import { useWeb3React } from '@web3-react/core'
import { MutationsContext } from '../../contexts'
import { initTransaction } from '../../lib/utils'

export default ({
  to,
  amount,
  oldDelegateNewPosPrev,
  oldDelegateNewPosNext,
  currDelegateNewPosPrev,
  currDelegateNewPosNext,
  disabled,
}) => {
  const client = useApolloClient()
  const context = useWeb3React()
  const { bond }: any = useContext(MutationsContext)

  if (!context.active) {
    return null
  }

  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => {
          initTransaction(client, async () => {
            await bond({
              variables: {
                amount: Utils.toWei(amount ? amount.toString() : '0'),
                to,
                oldDelegateNewPosPrev,
                oldDelegateNewPosNext,
                currDelegateNewPosPrev,
                currDelegateNewPosNext,
              },
            })
            // If user staked inside tour, close tour after staking
            client.writeData({
              data: {
                tourOpen: false,
              },
            })
          })
        }}
        sx={{ width: '100%' }}
      >
        Stake
      </Button>
    </>
  )
}
