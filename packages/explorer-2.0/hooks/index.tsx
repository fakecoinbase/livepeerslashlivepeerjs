import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'

export function useWeb3Mutation(mutation, options) {
  const initialState = {
    mutate: null,
    isBroadcasted: false,
    isMining: false,
    isMined: false,
    txHash: null,
    error: null,
  }
  const [result, setResult] = useState(initialState)

  const reset = useCallback(() => {
    setResult(initialState)
  }, [initialState])

  const [mutate, { data, error: mutationError }] = useMutation(
    mutation,
    options,
  )

  const GET_TRANSACTION_STATUS = gql`
    query getTxReceiptStatus($txHash: String!) {
      getTxReceiptStatus: getTxReceiptStatus(txHash: $txHash) {
        status
      }
    }
  `

  const { data: transaction, error: queryError } = useQuery(
    GET_TRANSACTION_STATUS,
    {
      variables: {
        txHash: `${data && data.txHash}`,
      },
      pollInterval: 2000,
      // skip query if tx hasn't yet been broadcasted or has been mined
      skip: !result.isBroadcasted || result.isMined,
    },
  )

  let isMining = !!(transaction && !transaction.getTxReceiptStatus.status)
  let isMined = !!(transaction && transaction.getTxReceiptStatus.status)

  useEffect(() => {
    if (mutate) {
      setResult({ ...result, mutate })
    }
    if (data) {
      setResult({ ...result, isBroadcasted: true, txHash: data.txHash })
    }
    if (transaction) {
      setResult({
        ...result,
        isMining: isMining && !isMined,
        isMined: isMined,
      })
    }
    if (mutationError) {
      setResult({
        ...result,
        error: mutationError,
      })
    }
    if (queryError) {
      setResult({
        ...result,
        error: queryError,
      })
    }
  }, [transaction, data, mutate])

  return { result, reset }
}

// modified from https://usehooks.com/usePrevious/
export function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef()

  // Store current value in ref
  useEffect(() => {
    ref.current = value
  }, [value]) // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current
}