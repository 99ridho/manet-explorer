// SPEC.md §8: operation select, sized input, Go / Randomize / Reset, optional variant tabs.
import { useId } from 'react'
import { DicesIcon, PlayIcon, RotateCcwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { OperationDefinition, VariantConfig } from '@/types/step-engine'
import { INPUT_PLACEHOLDER } from './input-parsing'

interface OperationBarProps {
  operations: OperationDefinition[]
  currentOperationId: string | null
  onOperationChange: (id: string) => void
  inputText: string
  onInputChange: (text: string) => void
  inputError: string | null
  onGo: () => void
  onRandomize: () => void
  onReset: () => void
  variant?: VariantConfig
  variantValue?: string
  onVariantChange?: (value: string) => void
}

export function OperationBar({
  operations,
  currentOperationId,
  onOperationChange,
  inputText,
  onInputChange,
  inputError,
  onGo,
  onRandomize,
  onReset,
  variant,
  variantValue,
  onVariantChange,
}: OperationBarProps) {
  const inputId = useId()
  const errorId = useId()
  const current = operations.find((op) => op.id === currentOperationId) ?? null
  const inputKind = current?.inputKind ?? 'none'

  return (
    <div className="space-y-3">
      {variant && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{variant.label}</p>
          <Tabs value={variantValue ?? variant.default} onValueChange={(v) => onVariantChange?.(v)}>
            <TabsList className="w-full">
              {variant.options.map((opt) => (
                <TabsTrigger key={opt.value} value={opt.value} className="flex-1">
                  {opt.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      {operations.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
          Operations for this topic are not built yet.
        </p>
      ) : (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            onGo()
          }}
        >
          <div className="flex flex-wrap gap-2">
            <Select value={currentOperationId ?? undefined} onValueChange={onOperationChange}>
              <SelectTrigger className="min-w-40 flex-1" aria-label="Operation">
                <SelectValue placeholder="Operation" />
              </SelectTrigger>
              <SelectContent>
                {operations.map((op) => (
                  <SelectItem key={op.id} value={op.id}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {inputKind !== 'none' && (
              <Input
                id={inputId}
                className={inputKind === 'text' ? 'min-w-56 flex-1 font-mono' : 'min-w-28 flex-1 font-mono'}
                inputMode={'text'}
                placeholder={current?.placeholder ?? INPUT_PLACEHOLDER[inputKind]}
                value={inputText}
                onChange={(e) => onInputChange(e.target.value)}
                aria-label={`${current?.label ?? 'Operation'} input`}
                aria-invalid={inputError ? true : undefined}
                aria-describedby={inputError ? errorId : undefined}
              />
            )}
            <Button type="submit" disabled={!current}>
              <PlayIcon /> Go
            </Button>
          </div>
          {inputError && (
            <p id={errorId} role="alert" className="text-sm text-destructive">
              {inputError}
            </p>
          )}
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onRandomize}>
          <DicesIcon /> Randomize
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcwIcon /> Reset
        </Button>
      </div>
    </div>
  )
}
