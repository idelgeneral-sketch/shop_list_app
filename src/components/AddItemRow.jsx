import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useProductSuggestions, recordProductUsage } from '../hooks/useProductSuggestions'

export const AddItemRow = forwardRef(function AddItemRow(
  { smartSearchEnabled, onSubmitItem, onEmptyBlurClose },
  ref
) {
  const [stage, setStage] = useState('name') // 'name' | 'quantity'
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const nameRef = useRef(null)
  const qtyRef = useRef(null)

  const suggestions = useProductSuggestions(name, smartSearchEnabled)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  useEffect(() => {
    if (stage === 'quantity') qtyRef.current?.focus()
  }, [stage])

  function goToQuantity() {
    if (!name.trim()) return
    setShowSuggestions(false)
    setStage('quantity')
  }

  function pickSuggestion(suggestion) {
    setName(suggestion.name)
    setShowSuggestions(false)
    setStage('quantity')
  }

  function finishItem() {
    const finalQuantity = quantity.trim() || '1'
    const finalName = name.trim()
    if (!finalName) return
    onSubmitItem({ name: finalName, quantity: finalQuantity })
    recordProductUsage(finalName)
    // reset for continuous entry
    setName('')
    setQuantity('')
    setStage('name')
    requestAnimationFrame(() => nameRef.current?.focus())
  }

  // Lets the parent (the outer + button) commit whatever is currently typed
  // — e.g. just a name with no quantity yet — the same way pressing Enter
  // on the quantity field does, and then open a fresh row.
  useImperativeHandle(ref, () => ({
    submitCurrent: finishItem,
    hasDraft: () => name.trim().length > 0,
  }))

  function handleNameKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      goToQuantity()
    } else if (e.key === 'Escape') {
      if (!name.trim()) onEmptyBlurClose?.()
    }
  }

  function handleQuantityKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      finishItem()
    }
  }

  return (
    <div className="item-row" style={{ border: '1.5px solid var(--primary)', boxShadow: 'none' }}>
      <div className="checkbox-btn" aria-hidden="true" />

      <div className="suggestions-wrap">
        <input
          ref={nameRef}
          className="item-name"
          placeholder="שם מוצר"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleNameKeyDown}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 120)
            if (!name.trim() && stage === 'name') onEmptyBlurClose?.()
          }}
        />
        {showSuggestions && smartSearchEnabled && suggestions.length > 0 && (
          <div className="suggestions-list">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                className="suggestion-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickSuggestion(s)}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        ref={qtyRef}
        className="item-quantity"
        placeholder="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        onKeyDown={handleQuantityKeyDown}
        onFocus={() => stage !== 'quantity' && setStage('quantity')}
      />
    </div>
  )
})
