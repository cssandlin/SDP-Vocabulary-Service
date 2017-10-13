module ApplicationHelper
  include Devise::OmniAuth::UrlHelpers

  def environment_tags
    disable_ur = Settings.disable_user_registration
    disable_ur = false if Settings.display_login
    safe_join [(tag.meta name: 'DISABLE_LOGIN_UI', content: disable_ur),
               (tag.meta name: 'environment', content: Rails.env)]
  end

  def force_json_encoding(x)
    if x.is_a? String
      x.force_encoding('ISO-8859-1').encode('UTF-8')
    else
      x
    end
  end
end
