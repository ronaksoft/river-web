import './style.scss';

export default function DialogSkeleton() {
    return (
        <div className="dialog-skeleton-wrapper">
            {[0, 0, 0, 0, 0, 0, 0].map((i, key) => (
                <div key={key} className="dialog-skeleton">
                    <div className="skeleton-avatar"/>
                    <div className="skeleton-name"/>
                    <div className="skeleton-preview"/>
                    <div className="skeleton-date"/>
                </div>)
            )}
        </div>);
}