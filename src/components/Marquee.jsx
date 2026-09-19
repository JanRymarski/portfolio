export default function Marquee({ items }) {
  return (
    <div className="marquee">
      <div className="marquee__track">
        {[...items, ...items].map((item, i) => (
          <span className="marquee__item" key={`${item}-${i}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}