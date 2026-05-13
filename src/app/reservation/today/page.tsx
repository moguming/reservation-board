"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

import Link from "next/link"

type Reservation = {
  id: number
  date: string
  time: string
  people: number
  name: string
  seat: string
}

export default function TodayPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])

  useEffect(() => {
    fetchReservations()

    const interval = setInterval(() => {
      fetchReservations()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getToday = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  const fetchReservations = async () => {
    const today = getToday()

    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("date", today)
      .order("time", { ascending: true })

    if (error) {
      console.log(error)
      return
    }

    setReservations(data || [])
  }

  const todayText = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  return (
    <main
        className="min-h-screen min-w-[1200px] bg-cover bg-center text-black"
        style={{
          backgroundImage: "url('/background.png')",
        }}
>
      <div className="flex h-screen flex-col p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-6xl font-bold">
              {todayText}
            </h1>

          </div>

          <div className="flex flex-col gap-4">
            <Link
              href="/reservation/new"
              className="rounded-2xl border border-black bg-white/30 px-3 py-3 text-center text-15px font-bold text-black"
            >
              예약 추가
            </Link>

            <Link
              href="/reservation/list"
              className="rounded-2xl border border-black bg-white/30 px-3 py-3 text-center text-15px font-bold text-black"
            >
              목록 보기
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-3xl border border-white/30 bg-white/15 backdrop-blur-sm">
          <div className="grid grid-cols-4 bg-stone/100 px-8 py-6 text-4xl font-bold">
            <div>시간</div>
            <div>인원</div>
            <div>성함</div>
            <div>좌석</div>
          </div>

          {reservations.length === 0 ? (
            <div className="flex h-96 items-center justify-center text-4xl text-black/40">
              오늘 예약이 없습니다
            </div>
          ) : (
            reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="grid grid-cols-4 border-t border-white/10 px-8 py-7 text-4xl"
              >
                <div>
                  {(() => {
                    const [hour, minute] = reservation.time.split(":")
                    const displayHour = Number(hour) > 12
                      ? Number(hour) - 12
                      : Number(hour)

                    return `${displayHour}:${minute}`
                  })()}
                </div>
                <div>{reservation.people}명</div>
                <div>{reservation.name}님</div>
                <div>{reservation.seat}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}