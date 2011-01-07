ActionView::Base.class_eval do
  def include_extjs(version='ext', theme=nil)
    resources = ''

    if Rails.env == 'development'
      resources << javascript_include_tag("/javascripts/ext_3_3_0/adapter/ext/ext-base-debug.js","ext_3_3_0/ext-all-debug.js")
    else
      resources << javascript_include_tag("/javascripts/ext_3_3_0/adapter/ext/ext-base.js","ext_3_3_0/ext-all.js")
    end

    resources << stylesheet_link_tag('/stylesheets/ext_3_3_0/resources/css/ext-all.css')

    unless theme.nil?
      resources << stylesheet_link_tag('/stylesheets/ext/resources/css/xtheme-slate.css')
    end

    resources
  end

  def setup_role_manager(user)
    roles = user.roles
    "<script type='text/javascript'>ErpApp.Authentication.RoleManager.roles = [#{roles.collect{|role| "'#{role.internal_identifier}'"}.join(',')}];</script>"
  end
end
