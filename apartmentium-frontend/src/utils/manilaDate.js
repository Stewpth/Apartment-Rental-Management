function getManilaDateParts(value = new Date()) {
  return new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(value)
    .reduce((parts, part) => {
      if (part.type !== "literal") parts[part.type] = part.value;
      return parts;
    }, {});
}

export function getTomorrowInManila() {
  const parts = getManilaDateParts();
  return new Date(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day) + 1),
  )
    .toISOString()
    .slice(0, 10);
}

export function getTodayInManila() {
  const parts = getManilaDateParts();
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function isAfterTodayInManila(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== value
  ) {
    return false;
  }

  const parts = getManilaDateParts();
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  return value > today;
}
