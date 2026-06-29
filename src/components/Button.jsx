// Generic button component — supports a "textOnly" style variant via prop
export default function Button({ children, textOnly, className, ...props }) {
  let cssClasses = textOnly ? 'text-button' : 'button';
  cssClasses += ' ' + className;

  return (
    <button className={cssClasses} {...props}>
      {children}
    </button>
  );
}