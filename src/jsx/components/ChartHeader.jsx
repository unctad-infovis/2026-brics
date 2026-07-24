import './ChartHeader.css';

export default function ChartHeader({ title, subtitle, description, large = false, children }) {
  return (
    <>
      <div className="brics_header">
        <h3 className={`brics_header_title${large ? ' brics_header_title--lg' : ''}`}>{title}</h3>
        {subtitle && <p className="brics_header_subtitle">{subtitle}</p>}
      </div>
      {(description || children) && (
        <p className="brics_insight">
          {description}
          {description && children && (
            <>
              <br />
              <br />
            </>
          )}
          {children}
        </p>
      )}
    </>
  );
}
