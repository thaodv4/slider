/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-statements */
/* eslint-disable max-lines */
import { useEffect, useRef, useState } from "react"

import { useDebounce } from "./useDebounce"

type Options = {
  itemGap: number
  marginEdge: number
  elementName: string
}
const HalfDiv = 2
const SecondIndex = 1
const StartPosition = 0
const NotFoundItem = -1
const TotalEdge = 2
const TotalIgnoreGap = 1
const DebouncedValue = 50
const StepValue = 1
const DefaultPosition = -1
const StartIndex = 0
const IgnoreToLastIndex = 1;

const isElementFullyVisible = (element: Element) => {
  const rect = element.getBoundingClientRect()

  const windowWidth = window.innerWidth || document.documentElement.clientWidth
  const isVisibleLeft = rect.left >= StartPosition && rect.left <= windowWidth
  const isVisibleRight =
    rect.right >= StartPosition && rect.right <= windowWidth

  const isVisible = isVisibleLeft && isVisibleRight
  return { isVisible, isVisibleLeft, isVisibleRight }
}

const getValueCenter = (element: Element, gap: number) => {
  const rect = element.getBoundingClientRect()
  const windowWidth = window.innerWidth || document.documentElement.clientWidth
  const centerPosition = windowWidth / HalfDiv
  const halfGap = gap / HalfDiv
  const isCenter = centerPosition >= rect.left && centerPosition <= rect.right
  const isNearGapLeft = centerPosition - rect.left <= halfGap
  const isNearGapRight = centerPosition - rect.right <= halfGap
  return isCenter || isNearGapLeft || isNearGapRight
}

const getElementOnScreen = (
  list: NodeListOf<Element> | undefined,
  gap: number,
) => {
  if (!list) return NotFoundItem
  return [...list].findIndex((item) => getValueCenter(item, gap))
}

const handleScroll = ({
  element,
  index,
  itemGap,
  marginEdge,
  lengthItem,
}: {
  element: HTMLElement | HTMLUListElement | null
  index: number
  itemGap: number
  marginEdge: number
  lengthItem: number
}) => {
  if (!element) return
  const itemWidth =
    (element.scrollWidth -
      itemGap * (lengthItem - TotalIgnoreGap) -
      marginEdge * TotalEdge) /
    lengthItem
  const innerWidth = (window.innerWidth - itemWidth) / HalfDiv
  const firstTranslate = itemWidth + marginEdge + itemGap - innerWidth
  const result = firstTranslate + (itemWidth + itemGap) * (index - SecondIndex)
  element.scrollTo({ left: result })
}

export const useHelperScroll = ({
  itemGap,
  marginEdge,
  elementName,
}: Options) => {
  const scrollContainerReference = useRef<
    HTMLElement | HTMLUListElement | null
  >(null)
  const [isEnd, setIsEnd] = useState(false)
  const [isStart, setIsStart] = useState(false)
  const [positionEnd, setPositionEnd] = useState(DefaultPosition)
  const setElement = (htmlElement: HTMLElement | HTMLUListElement | null) => {
    scrollContainerReference.current = htmlElement
  }

  const [scrollValue, setScrollValue] = useState(DefaultPosition)
  const scrollDeferredValue = useDebounce(scrollValue, DebouncedValue)

  const handleScrollEffect = () => {
    if (scrollContainerReference.current) {
      const childrenElement =
        scrollContainerReference.current.querySelectorAll(elementName)
      let index = DefaultPosition
      // Check start element =
      if (isElementFullyVisible(childrenElement[StartIndex]).isVisible)
        index = StartIndex
      const lastIndex = childrenElement.length - IgnoreToLastIndex
      if (isElementFullyVisible(childrenElement[lastIndex]).isVisible)
        index = lastIndex
      if (DefaultPosition === index)
        index = getElementOnScreen(childrenElement, itemGap)
      handleScroll({
        element: scrollContainerReference.current,
        index,
        itemGap,
        lengthItem: childrenElement.length,
        marginEdge,
      })
    }
  }

  useEffect(() => {
    if (isEnd && isStart && scrollValue !== positionEnd) {
      setPositionEnd(scrollValue)
      handleScrollEffect()
      setIsStart(false)
      setIsEnd(false)
    }
  }, [scrollDeferredValue])

  useEffect(() => {
    setTimeout(() => {
      setScrollValue((state) => {
        if (isEnd && isStart && state === positionEnd) {
          handleScrollEffect()
          setIsStart(false)
          setIsEnd(false)
        }
        return state
      })
    }, DebouncedValue)
  }, [isEnd, isStart])

  const handleScrollEnd = () => {
    console.log("scroll")
    setScrollValue((state) => state + StepValue)
  }
  const handleTouchStart = () => {
    console.log("touched")
    setIsEnd(false)
    setIsStart(true)
  }
  const handleTouchEnd = () => {
    console.log("touched")
    setIsEnd(true)
    setPositionEnd(scrollValue)
  }

  useEffect(() => {
    scrollContainerReference.current?.addEventListener(
      "touchstart",
      handleTouchStart,
    )
    scrollContainerReference.current?.addEventListener(
      "touchend",
      handleTouchEnd,
    )
    scrollContainerReference.current?.addEventListener(
      "scroll",
      handleScrollEnd,
    )
    return () => {
      scrollContainerReference.current?.removeEventListener(
        "touchstart",
        handleTouchStart,
      )
      scrollContainerReference.current?.removeEventListener(
        "touchend",
        handleTouchEnd,
      )
      scrollContainerReference.current?.removeEventListener(
        "scroll",
        handleScrollEnd,
      )
    }
  }, [handleTouchEnd, handleTouchStart, handleScrollEnd])

  return {
    setElement,
  }
}