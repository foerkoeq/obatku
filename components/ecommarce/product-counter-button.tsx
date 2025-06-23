'use client'
import React from 'react'
import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

const ProductCounterButton = ({ className }: { className?: string }) => {
    const [count, setCount] = React.useState<number>(1)
    const handleIncreaseQuantity = () => {

        if (count < 10) {
            setCount(count + 1)
        }

    }
    const handleDecreaseQuantity = () => {

        if (count > 0) {
            setCount(count - 1)
        }
    }
    return (
        <div className={cn('flex-1 h-8 md:max-w-[112px] max-w-[95px] flex border dark:bg-default-300  delay-150 ease-in-out  divide-x-[1px] rtl:divide-x-reverse text-sm font-normal divide-border  rounded', className)}>
            <button className="md:px-3 px-2 disabled:cursor-not-allowed cursor-pointer" onClick={handleDecreaseQuantity}
                disabled={count === 0}
            >
                <Icon icon="eva:minus-fill" className="text-default-700" />
            </button>
            <span className="flex-1 text-xs  text-center flex items-center justify-center text-default-700">
                {count}
            </span>
            <button
                disabled={count === 10}
                onClick={handleIncreaseQuantity}
                className="md:px-3 px-2 disabled:cursor-not-allowed cursor-pointer">
                <Icon icon="eva:plus-fill" className="text-default-700" />
            </button>
        </div>
    )
}

export default ProductCounterButton